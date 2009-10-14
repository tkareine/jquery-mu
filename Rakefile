release_dir = "releases"
version = ENV["version"] || "snapshot"

require "rake/clean"
CLOBBER.include(release_dir)

desc "Make a release"
task :release do |t|
  mkdir_p "releases"
  system "juicer merge -i -c none -o #{release_dir}/jquery.mu-#{version}.min.js lib/*.js"
end

desc "Search unfinished parts of source code"
task :todo do
  FileList["lib/**/*.js", "spec/**/*.js", "**/*.md", "**/*.txt"].egrep /(TODO|FIXME)/
end

task :default => :release
