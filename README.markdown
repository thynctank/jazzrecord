##Hiya! (Intro)

JazzRecord is a (Rails 2) ActiveRecord clone for providing a JavaScript ORM layer. It currently supports [Gears](http://gears.google.com), [Adobe AIR](http://www.adobe.com/products/air/), and [Appcelerator Titanium](http://www.appcelerator.com/). Like ActiveRecord, Jazz is free and open-source software, licensed under [MIT License](http://www.opensource.org/licenses/mit-license.php). And in being inspired by ActiveRecord, Jazz seeks to minimize its learning curve by mimicking ActiveRecord style and conventions.

JazzRecord is almost feature-complete, and it has been tested thoroughly across all major browsers and other runtimes using a test suite called [JSSpec](http://jania.pe.kr/aw/moin.cgi/JSSpec). Titanium testing will be implemented shortly. AIR support is fully tested.

**NOTE**: a [Titanium bug](https://appcelerator.lighthouseapp.com/projects/25719/tickets/425-null-values-return-as-typecast-values-rather-than-null) is causing JazzRecord to misbehave. The test suite is currently failing. JazzRecord will not behave correctly in Titanium.

##Future Development

Currently underway is work to complete the feature set of JazzRecord, which consists of... rich dirty records support, implementing a few add'l finder options, and adding support for encrypted local databases for AIR 1.5+. We aim to support as many runtimes as we can, so feel free to submit a request or write your own adapter!

##Dependencies

None! JazzRecord is now MooTools free, and works with any JavaScript library. We're _very_ excited about the possibilities this opens up.

##More Info

For more information, a demo and the most recent documentation, visit [JazzRecord.org](http://www.jazzrecord.org)

For regular updates on JazzRecord development, follow us on Twitter: [@jazzrecord](http://www.twitter.com/jazzrecord)

To contact Nick Carter regarding bugs or for questions, email me at <thynctank@thynctank.com>