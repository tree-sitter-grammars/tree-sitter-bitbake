addhandler myclass_eventhandler
python myclass_eventhandler() {
    from bb.event import getName
    print("The name of the Event is %s" % getName(e))
    print("The file we run for is %s" % d.getVar('FILE'))
}
myclass_eventhandler[eventmask] = "bb.event.BuildStarted
bb.event.BuildCompleted"
