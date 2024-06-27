import sbt._

object Dependencies {
  // Runtime
  lazy val jsonoid             = "io.github.dataunitylab"     %% "jsonoid-discovery"      % "0.30.0"

  // Test
  lazy val scalaTest           = "org.scalatestplus.play"     %% "scalatestplus-play"     % "5.1.0"
}
