OVERRIDES = "foo"
A = "Z"
A:foo:append = "X"

OVERRIDES = "foo"
A = "Z"
A:append:foo = "X"

OVERRIDES = "foo"
A = "Y"
A:foo:append = "Z"
A:foo:append = "X"

A = "1"
A:append = "2"
A:append = "3"
A += "4"
A .= "5"
