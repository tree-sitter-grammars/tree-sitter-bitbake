python some_python_function () {
    d.setVar("TEXT", "Hello World")
    print d.getVar("TEXT")
}

python do_foo:prepend() {
    bb.plain("first")
}

python do_foo() {
    bb.plain("second")
}

python do_foo:append() {
    bb.plain("third")
}
