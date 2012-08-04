Format.js
=========

*Format* is a [huk](https://github.com/gerhardberger/HuK) bundle, that lets you create nice **groups** and **brackets** (single and double elimination) used in sports tournaments. It depends on Underscore, jQuery, [Skeleton](http://www.getskeleton.com/), styled and huk. [Demo](http://felix.lovassy.hu/projects/gellert/format/example.html)

Example
-------

``` js
huk('.container')
  .groups({
    count: 4
    , size: 4
    , name: 'Test groups'
  })
  .
  .bracket({
    name: 'Brackets'
    , type: 'de'
    , size: 32
  })
```

.groups(*options*)
------------------

 * `count`: Number of groups (default: 1)
 * `size`: The size of each group (default: 0)
 * `name`: The name of the group (default: *Group Stage*)

.bracket(*options*)
------------------

 * `size`: The size of the bracket, has to be the power of 2 (default: 2)
 * `name`: The name of the bracket (default: *Bracket Stage*)
 * `type`: **se** == *Single elimination*, **de** == *Doubleelimination* (default: *se*)