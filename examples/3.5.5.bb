python () {
    if d.getVar('SOMEVAR') == 'value':
        d.setVar('ANOTHERVAR', 'value2')
}

python () {
    d.setVar('FOO', 'foo 2')
}

FOO = "foo 1"

python () {
    d.appendVar('BAR',' bar 2')
}

BAR = "bar 1"

FOO = "foo 1"
BAR = "bar 1"
FOO = "foo 2"
BAR += "bar 2"

FOO = "foo"
FOO:append = " from outside"

python () {
    d.setVar("FOO", "foo from anonymous")
}
