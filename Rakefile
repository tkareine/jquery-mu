version = ENV["version"] || "snapshot"

RHINO_JAR = File.expand_path "~/lib/jars/js.jar"
YUI_COMPRESSOR_JAR = File.expand_path "~/lib/jars/yuicompressor.jar"

def minify(assets, to)
  return if assets.empty?
  type = assets.first[/\.([^.]+)$/, 1]
  raise ArgumentError, "Unknown asset type" if type.nil?
  puts "Minifying #{type} type assets to #{to}..."
  IO.popen("java -jar #{YUI_COMPRESSOR_JAR} -v --charset=utf-8 --type=#{type} -o #{to}", "w") do |pipe|
    assets.each do |asset|
      puts "  #{asset}"
      IO.foreach(asset) do |line|
        pipe << (block_given? ? yield(line) : line)
      end
    end
  end
end

desc "Make a release"
task :release do
  minify Dir["lib/**/*.js"], "releases/jquery.mu-#{version}.min.js" do |line|
    line.gsub "$VERSION", version
  end
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
  FileList["lib/**/*.js", "test/**/*.js", "**/*.md", "**/*.txt"].egrep /(TODO|FIXME)/
end

task :default => :test
