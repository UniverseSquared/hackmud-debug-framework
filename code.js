function(context, args)
{
	var bal = #s.accts.balance();
	#s.accts.xfer_gc_to({amount:5, to:"malware"});
	#s.accts.xfer_gc_to({amount:5, to:"trust", memo:"Trust, have my gc!"});
	#s.accts.xfer_gc_to_caller({amount:5, memo:"You can have some back."});
	var bal2 = #s.accts.balance();
	var channels = #s.chats.channels();
	#s.chats.send({channel:"0000", msg:"hello world"});
	return "hello world!\nYour old balance: " + bal + "\nYour new balance: " + bal2 + "\n\n" + channels + "\nYour sys.loc: " + #s.sys.loc() + "\n" + #s.scripts.get_level({name:"sys.status"});
}