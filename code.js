function(context, args)
{
	// Declare a function to get the security level name from a number.
	function getSeclevelName(i) {
		return ["NULLSEC", "LOWSEC", "MIDSEC", "HIGHSEC", "FULLSEC"][i];
	}
	// Transfer 5GC to the user with the memo 'have fun!'
	// Calls accts.xfer_gc_to_caller
	// accts.xfer_gc_to_caller shows that the gc comes from trust.
	#s.accts.xfer_gc_to_caller({amount:5, memo:"have fun!"});
	// Transfer 10GC back to trust with the memo 'nah, you can.'
	#s.accts.xfer_gc_to({to:"trust", amount:10, memo:"nah, you can."});
	// Declare the variable 'out'.
	var out = "";
	// Append text to 'out'.
	out += "Well, that was fun!";
	// Get the player's balance and add it to out.
	// accts.balance just returns a number, so we add 'GC' to the end.
	// It will obviously not be formatted correctly, but that's fine for now.
	var bal = #s.accts.balance();
	out += "\nYou have: " + bal + "GC.\n\n";
	// Get the channels the player is in, and add it to out.
	out += #s.chats.channels();
	// Get the security level of 'trust.me' (NULLSEC - 0)
	var sec = #s.scripts.get_level({name:"trust.me"});
	// Use the function declared above to get the name of the security level, and add it to out
	out += "\ntrust.me is " + getSeclevelName(sec);
	// Finally, output 'out'
	return out;
	// Output of this script:
	// https://pastebin.com/8B8Wtz99
}