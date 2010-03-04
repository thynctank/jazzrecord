def build_minified_script(output, version)
  script_names = %w(jazz_record adapters record/record record/is_changed record/save model/model association_loader util record/validate model/query save model/destroy model/find migrations/schema_operations migrations/migrate)
  
  build_time = Time.now
  new_js = <<HEADER_INFO
//JazzRecord Version #{version} build #{build_time.to_i}
//Copyright (c) #{build_time.year} Nick Carter <thynctank@thynctank.com>
//
//Permission is hereby granted, free of charge, to any person
//obtaining a copy of this software and associated documentation
//files (the "Software"), to deal in the Software without
//restriction, including without limitation the rights to use,
//copy, modify, merge, publish, distribute, sublicense, and/or sell
//copies of the Software, and to permit persons to whom the
//Software is furnished to do so, subject to the following
//conditions:
//
//The above copyright notice and this permission notice shall be
//included in all copies or substantial portions of the Software.
//
//THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
//EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
//OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
//NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
//HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
//WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
//FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
//OTHER DEALINGS IN THE SOFTWARE.
HEADER_INFO

  script_names.each do |script_name|
    compressor = IO.popen("java -jar yuicompressor-2.3.6.jar --type js --charset UTF-8", "w+")
    compressor.puts IO.read("source/#{script_name}.js")
    compressor.close_write
    new_js += compressor.gets
  end
  
  File.open("build/#{output}.js", "w") { |file| file.write(new_js) }  
end

desc "Builds custom-named JazzRecord file"
task :build do
  if ENV['output']
    build_minified_script(ENV['output'])
  else
    puts "Usage:"
    puts "\trake build output=outputscriptname"
    puts "Output:"
    puts "\toutputscriptname.js (minified, compressed script)"
    puts "Wrote #{ENV['output']}"
  end    
end

desc "Build jazz_record.js"
task :default do
  if ENV['version']
    build_minified_script('jazz_record', ENV['version'])
    puts "Wrote jazz_record.js"
  else
    puts "Usage:"
    puts "\trake version=X.X"
  end
end