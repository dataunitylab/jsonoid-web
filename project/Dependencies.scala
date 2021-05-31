import sbt._

object Dependencies {
  // Runtime
  lazy val jsonoid             = "edu.rit.cs"                 %% "jsonoid-discovery"      % "0.1.0"

  // Test
  lazy val scalaTest           = "org.scalatestplus.play"     %% "scalatestplus-play"     % "5.0.0"
}
