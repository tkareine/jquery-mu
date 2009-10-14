version = ENV["version"] || "snapshot"

desc "Make a release"
task :release do |t|
  system "juicer merge -i -c none -o releases/jquery.mu-#{version}.min.js lib/*.js"
end

desc "Search unfinished parts of source code"
task :todo do
  FileList["lib/**/*.js", "spec/**/*.js", "**/*.md", "**/*.txt"].egrep /(TODO|FIXME)/
end

task :default => :release
