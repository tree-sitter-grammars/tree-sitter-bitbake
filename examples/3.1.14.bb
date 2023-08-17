DATE = "${@time.strftime('%Y%m%d',time.gmtime())}"

PN = "${@bb.parse.vars_from_file(d.getVar('FILE', False),d)[0] or 'defaultpkgname'}"
PV = "${@bb.parse.vars_from_file(d.getVar('FILE', False),d)[1] or '1.0'}"

FOO = "${@foo()}"

FOO := "${@foo()}"
