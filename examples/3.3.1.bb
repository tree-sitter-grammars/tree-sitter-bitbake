OVERRIDES = "architecture:os:machine"
TEST = "default"
TEST:os = "osspecific"
TEST:nooverride = "othercondvalue"

KBRANCH = "standard/base"
KBRANCH:qemuarm = "standard/arm-versatile-926ejs"
KBRANCH:qemumips = "standard/mti-malta32"
KBRANCH:qemuppc = "standard/qemuppc"
KBRANCH:qemux86 = "standard/common-pc/base"
KBRANCH:qemux86-64 = "standard/common-pc-64/base"
KBRANCH:qemumips64 = "standard/mti-malta64"

DEPENDS = "glibc ncurses"
OVERRIDES = "machine:local"
DEPENDS:append:machine = "libmad"

KERNEL_FEATURES:append = " ${KERNEL_EXTRA_FEATURES}"
KERNEL_FEATURES:append:qemux86=" cfg/sound.scc cfg/paravirt_kvm.scc"
KERNEL_FEATURES:append:qemux86-64=" cfg/sound.scc cfg/paravirt_kvm.scc"

FOO:task-configure = "val 1"
FOO:task-compile = "val 2"

EXTRA_OEMAKE:prepend:task-compile = "${PARALLEL_MAKE} "
