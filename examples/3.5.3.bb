def get_depends(d):
    if d.getVar('SOMECONDITION'):
        return "dependencywithcond"
    else:
        return "dependency"

SOMECONDITION = "1"
DEPENDS = "${@get_depends(d)}"
