def build_minified_script(output)
  script_names = %w(core record record_is_changed record_save model association_loader util validate query save destroy find migration)
  
  new_js = ""
  
  script_names.each do |script_name|
    compressor = IO.popen("java -jar yuicompressor-2.3.6.jar --type js -v --charset UTF-8", "w+")
    compressor.puts IO.read("javascripts/#{script_name}.js")
    compressor.close_write
    new_js += compressor.gets
  end
  
  File.open("build/#{output}.js", "w") { |file| file.write(new_js) }  
end

desc "Builds custom-named JazzRecord file"
task :build do
  if ENV['OUTPUT']
    build_minified_script(ENV['OUTPUT'])
  else
    puts "Usage:"
    puts "\trake build OUTPUT=outputscriptname"
    puts "Output:"
    puts "\toutputscriptname.js (minified, compressed script)"
    puts "Wrote #{ENV['OUTPUT']}"
  end    
end

desc "Build jazz_record.js"
task :default do
  build_minified_script('jazz_record')
  puts "Wrote jazz_record.js"
end