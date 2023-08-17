python do_printdate () {
    import time
    print time.strftime('%Y%m%d', time.gmtime())
}

addtask printdate after do_fetch before do_build

do_printdate[nostamp] = "1"

addtask printdate

addtask package_write_tar before do_build after do_packagedata do_package
