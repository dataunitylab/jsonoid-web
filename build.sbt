import Dependencies._

ThisBuild / scalaVersion      := "2.12.12"
ThisBuild / versionScheme     := Some("early-semver")
ThisBuild / organization      := "edu.rit.cs"
ThisBuild / organizationName  := "Rochester Institute of Technology"
ThisBuild / githubOwner       := "michaelmior"
ThisBuild / githubRepository  := "jsonoid-web"

Global / onChangedBuildSource := ReloadOnSourceChanges

Compile / herokuAppName := "jsonoid"

lazy val root = (project in file("."))
  .settings(
    name := "JSONoid Web",
    resolvers += Resolver.githubPackages("michaelmior"),
    libraryDependencies ++= Seq(
        guice,
        jsonoid,

        scalaTest % Test,
    ),
    watchSources ++= (baseDirectory.value / "public/ui" ** "*").get,
    scalacOptions ++= Seq(
      "-feature",
      "-Xfatal-warnings",
    )
  )

wartremoverErrors ++= Seq(
  Wart.ArrayEquals,
  Wart.EitherProjectionPartial,
  Wart.Enumeration,
  Wart.Equals,
  Wart.ExplicitImplicitTypes,
  Wart.FinalCaseClass,
  Wart.MutableDataStructures,
  Wart.NonUnitStatements,
  Wart.Null,
  Wart.Option2Iterable,
  Wart.PublicInference,
  Wart.Recursion,
  Wart.Return,
  Wart.StringPlusAny,
  Wart.TraversableOps,
  Wart.TryPartial,
  Wart.While,
)

enablePlugins(GitVersioning)
enablePlugins(PlayScala)
enablePlugins(SiteScaladocPlugin)

git.remoteRepo := "git@github.com:michaelmior/jsonoid-web.git"
git.useGitDescribe := true
