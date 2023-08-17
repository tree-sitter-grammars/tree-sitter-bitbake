EXPORT_FUNCTIONS functionname

EXPORT_FUNCTIONS do_foo

do_foo() {
    if [ somecondition ] ; then
        bar_do_foo
    else
        # Do something else
    fi
}
