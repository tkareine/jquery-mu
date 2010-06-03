version = ENV["version"] || "snapshot"

RHINO_JAR = File.expand_path "~/lib/jars/js.jar"

desc "Make a release"
task :release do |t|
  system "juicer merge -i -c none -o releases/jquery.mu-#{version}.min.js lib/*.js"
end

desc "Run code quality checks"
task :lint do
  sh %{java -jar #{RHINO_JAR} -opt 1 test/jslint-check.js}
end

desc "Open and run specs"
task :spec do
  sh %{open test/suite.dom.html}
end

desc "Run code quality checks, open and run specs"
task :test => [:lint, :spec]

desc "Search unfinished parts of source code"
task :todo do
  FileList["lib/**/*.js", "spec/**/*.js", "**/*.md", "**/*.txt"].egrep /(TODO|FIXME)/
end

task :default => :test
