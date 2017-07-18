function(context, args)
{
	// #D will disable the return output
	#D("Hello world!");
	// The script doesn't exist and will throw an error.
	#s.the.script({doesnt:"exist"});
	// As such, the message in return will not show
	return {ok:true, msg:"You won't see this."}
}