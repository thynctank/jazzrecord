def build_minified_script(output)
  script_names = %w(core.js record.js model.js association_loader.js util.js validate.js query.js save.js destroy.js find.js migration.js)
  
  new_js = ""
  
  script_names.each do |script_name|
    compressor = IO.popen("java -jar yuicompressor-2.3.6.jar --type js", "w+")
    compressor.puts IO.read("javascripts/#{script_name}")
    compressor.close_write
    new_js += compressor.gets
  end
  
  File.open("build/#{output}.js", "w") { |file| file.write(new_js) }  
end

desc "Builds JazzRecord out of dust"
task :build do
  if ENV['OUTPUT']
    build_minified_script(ENV['OUTPUT'])
  else
    puts "Usage:"
    puts "rake build OUTPUT=outputscriptname"
    puts "Outputs:"
    puts "outputscriptname.js (minified, compressed script)"
  end    
end

desc "Build jazzrecord.js"
task :default do
  build_minified_script('jazz_record')
end