import sbt._

object Dependencies {
  // Runtime
  lazy val jsonoid             = "edu.rit.cs"                 %% "jsonoid-discovery"      % "0.10.0"

  // Test
  lazy val scalaTest           = "org.scalatestplus.play"     %% "scalatestplus-play"     % "4.0.0"
}
