##Hiya! (Intro)

JazzRecord is a simplified ActiveRecord clone for providing a JavaScript ORM layer. It currently supports [Gears](http://gears.google.com), [Adobe AIR](http://www.adobe.com/products/air/), and [Titanium PR1](http://titaniumapp.com/). Like ActiveRecord, Jazz is free and open-source software. And in being inspired by ActiveRecord, Jazz seeks to minimize its learning curve by mimicking ActiveRecord style and conventions.

JazzRecord is almost feature-complete, and most of it has been tested thoroughly across all major browsers using a test suite called [JSSpec](http://jania.pe.kr/aw/moin.cgi/JSSpec). AIR-side testing will be implemented shortly.

##Current Development

Currently underway is work to complete the feature set of JazzRecord, which consists of... finishing off validations, getting manual migrations working, completing callback support, rich dirty records support, implementing add'l finder options, and adding support for encrypted local databases for AIR 1.5.

Last bit that needs doing is modifying how records are grabbed out of the db, as JazzRecord could use a speed boost.

We've also got a massive refactor around the corner where we'll be writing a version of JazzRecord minus the MooTools dependency. We're unsure yet whether we'll be maintaining the moo version after that or not, but we're very excited about the possibilities this might open up.

##More Info

For more information, a demo and current documentation, visit [JazzRecord.org](http://www.jazzrecord.org)

For regular updates on JazzRecord development, follow us on Twitter: [@jazzrecord](http://www.twitter.com/jazzrecord)