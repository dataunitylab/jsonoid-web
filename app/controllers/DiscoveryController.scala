package controllers

import javax.inject._

import scala.concurrent.{ExecutionContext, Future}
import scala.language.implicitConversions

import akka.stream.scaladsl._
import akka.util.ByteString
import play.api._
import play.api.cache._
import play.api.libs.json._
import play.api.libs.streams._
import play.api.mvc._

import play.api.libs.{json => pjson}
import org.{json4s => j4s}

import io.github.dataunitylab.jsonoid.discovery.{
  DiscoverSchema,
  EquivalenceRelation,
  EquivalenceRelations,
  JsonoidParams
}
import io.github.dataunitylab.jsonoid.discovery.schemas._
import io.github.dataunitylab.jsonoid.discovery.utils.JsonPointer

// From @pamu on Stack Overflow
// https://stackoverflow.com/a/40389901/123695
// https://creativecommons.org/licenses/by-sa/4.0/
object Conversions {
  @SuppressWarnings(Array("org.wartremover.warts.Recursion"))
  implicit def toJson4s(json: play.api.libs.json.JsValue): org.json4s.JValue =
    json match {
      case pjson.JsString(str)    => j4s.JString(str)
      case pjson.JsNull           => j4s.JNull
      case pjson.JsBoolean(value) => j4s.JBool(value)
      case pjson.JsFalse          => j4s.JBool(false)
      case pjson.JsTrue           => j4s.JBool(true)
      case pjson.JsNumber(value)  => j4s.JDecimal(value)
      case pjson.JsArray(items)   => j4s.JArray(items.map(toJson4s(_)).toList)
      case pjson.JsObject(items) =>
        j4s.JObject(items.map { case (k, v) => k -> toJson4s(v) }.toList)
    }

  @SuppressWarnings(Array("org.wartremover.warts.Recursion"))
  implicit def toPlayJson(json: org.json4s.JValue): play.api.libs.json.JsValue =
    json match {
      case j4s.JString(str)    => pjson.JsString(str)
      case j4s.JNothing        => pjson.JsNull
      case j4s.JNull           => pjson.JsNull
      case j4s.JDecimal(value) => pjson.JsNumber(value)
      case j4s.JDouble(value)  => pjson.JsNumber(value)
      case j4s.JInt(value)     => pjson.JsNumber(BigDecimal(value))
      case j4s.JLong(value)    => pjson.JsNumber(BigDecimal(value))
      case j4s.JBool(value)    => pjson.JsBoolean(value)
      case j4s.JSet(fields)    => pjson.JsArray(fields.toList.map(toPlayJson(_)))
      case j4s.JArray(fields)  => pjson.JsArray(fields.map(toPlayJson(_)))
      case j4s.JObject(fields) =>
        pjson.JsObject(fields.map { case (k, v) => k -> toPlayJson(v) }.toMap)
    }
}

import Conversions._

@Singleton
class DiscoveryController @Inject() (
    cc: ControllerComponents,
    cache: SyncCacheApi
)(implicit ec: ExecutionContext)
    extends AbstractController(cc) {
  val ndjson: BodyParser[Seq[pjson.JsValue]] = BodyParser { req =>
    val sink: Sink[ByteString, Future[Seq[pjson.JsValue]]] = Flow[ByteString]
      .via(JsonFraming.objectScanner(Int.MaxValue))
      .map(x => Json.parse(x.utf8String))
      .toMat(Sink.fold(Seq.empty[pjson.JsValue])(_ :+ _))(Keep.right)

    Accumulator(sink).map(Right.apply)
  }

  private def uuidFromSession(session: Session): String = {
    session.get("uuid") match {
      case Some(uuidStr) => uuidStr
      case None          => java.util.UUID.randomUUID().toString()
    }
  }

  def discover: Action[Seq[pjson.JsValue]] = Action(ndjson) {
    request: Request[Seq[pjson.JsValue]] =>
      implicit val er: EquivalenceRelation =
        EquivalenceRelations.KindEquivalenceRelation
      val propSetName =
        request.headers.get("X-Jsonoid-Property-Set").getOrElse("All")
      val propSet = propSetName match {
        case "Min"    => PropertySets.MinProperties
        case "Simple" => PropertySets.SimpleProperties
        case _        => PropertySets.AllProperties
      }
      val jsons: Seq[j4s.JValue] = request.body.map(Conversions.toJson4s(_))
      val p = JsonoidParams().withPropertySet(propSet)
      val schema = DiscoverSchema.discover(jsons.iterator)(p)
      val transformedSchema =
        DiscoverSchema.transformSchema(schema).asInstanceOf[ObjectSchema]

      // Save transformed schema in session
      var uuid = uuidFromSession(request.session)
      cache.set(uuid + ":schema", transformedSchema)

      val finalSchema: pjson.JsValue = transformedSchema.toJsonSchema()(p)
      Ok(finalSchema).withSession("uuid" -> uuid)
  }

  def checkBloom(path: String, value: String): Action[AnyContent] = Action {
    implicit request =>
      var uuid = uuidFromSession(request.session)
      val maybeSchema = cache.get[ObjectSchema](uuid + ":schema")

      maybeSchema match {
        case None => BadRequest(Json.obj("error" -> "Not found in cache"))
        case Some(transformedSchema) =>
          val matches = transformedSchema.findByPointer(
            JsonPointer.fromString(path)
          ) match {
            case Some(s: StringSchema) =>
              Some(
                s.properties
                  .get[StringBloomFilterProperty]
                  .bloomFilter
                  .contains(value)
              )
            case Some(i: IntegerSchema) =>
              Some(
                i.properties
                  .get[IntBloomFilterProperty]
                  .bloomFilter
                  .contains(value.toInt)
              )
            case _ => None
          }
          matches match {
            case Some(didMatch) => Ok(Json.obj("matches" -> didMatch))
            case None           => BadRequest(Json.obj("error" -> "Path not found"))
          }
      }
  }
}
