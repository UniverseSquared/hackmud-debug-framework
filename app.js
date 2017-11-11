var fs = require("fs");
var a = process.argv;
var file = "code.js";
var config = require("./config.json");
if(a.length > 2) {
	a = a.slice(2);
	file = a[0];
}
if(!fs.existsSync(file)) {
	console.log("The script should be called 'code.js' in the same folder as 'app.js'.");
	console.log("You can also specify a file to be interpreted as the first argument for the program.");
	process.exit(1);
}
var balance = 1000;
// Structure of a transaction:
// {
// 	amount: <amount>,
// 	sender: <sender>,
// 	recipient: <recipient>,
// 	memo: <memo>
// }
// Note: 'memo' will only exist if there was a memo.
var tran = [];
var ch = ["0000"];
var username = "universe";
var breached = false;
var retout = true;
function getSeclevelName(i) {
	return ["NULLSEC", "LOWSEC", "MIDSEC", "HIGHSEC", "FULLSEC"][i];
}
// Scripts the code will have access to.
var _scripts = {
	accts: {
		balance: () => {
			return balance;
		},
		xfer_gc_to: (o) => {
			if(o.memo) {
				tran.push({amount:o.amount, sender:username, recipient:o.to, memo:o.memo});
			} else {
				tran.push({amount:o.amount, sender:username, recipient:o.to});
			}
			balance -= o.amount;
			console.log("Transferred " + o.amount + " to " + o.to + (o.memo ? " : " + o.memo : "") + "\n");
			return true;
		},
		xfer_gc_to_caller: (o) => {
			if(o.memo) {
				tran.push({amount:o.amount, sender:"trust", recipient:username, memo:o.memo});
			} else {
				tran.push({amount:o.amount, sender:"trust", recipient:username});
			}
			balance += o.amount;
			console.log("Received " + o.amount + " from trust" + (o.memo ? " : " + o.memo : "") + "\n")
		},
		transactions: () => {
			return tran;
		}
	},
	chats: {
		channels: () => {
			return ch.map(v=>v+"\n");
		},
		send: (o) => {
			if(!ch.includes(o.channel)) {
				return "you aren't in " + o.channel + ". join channel with chats.join"
			}
			console.log(o.channel + " " + username + " :::" + o.msg + ":::");
		},
		tell: (o) => {
			console.log("to " + o.to + " :::" + o.msg + ":::");
		}
	},
	trust: {
		me: () => {
			return "thank you";
		}
	},
	sys: {
		loc: () => {
			console.log("\nsys.loc called from code\n");
			return username + ".entry_p5hf7b"
		},
		status: () => {
			return {breached:breached};
		},
		breach: (o) => {
			if(o.confirm) {
				breached = true;
			} else {
				return "Usage: sys.breach {confirm: true}\nbreaches sys";
			}
		}
	},
	scripts: {
		get_level: (o) => {
			let a = o.name.split(".");
			return _seclevels[a[0]][a[1]];
		},
		get_access_level: () => {
			return {public:true, private:false, trust:true};
		},
		ensure_highsec: () => {
			return "";
		},
		ensure_midsec: () => {
			return "";
		},
		ensure_lowsec: () => {
			return "";
		},
		ensure_nullsec: () => {
			return "";
		}
	}
}

// The security levels for all the scripts
var _seclevels = {
	accts: {
		balance: 3,
		xfer_gc_to: 2,
		xfer_gc_to_caller: 4,
		transactions: 3
	},
	chats: {
		channels: 2,
		send: 4,
		tell: 4
	},
	trust: {
		me: 0
	},
	sys: {
		loc: 1,
		status: 3,
		breach: 0,
	},
	scripts: {
		get_level: 4,
		get_access_level: 4,
		ensure_highsec: 3,
		ensure_midsec: 2,
		ensure_lowsec: 1,
		ensure_nullsec: 0
	},
	scripts: {
		get_level: 4,
		get_access_level: 4
	}
}

// The global object for scripts
// Preserved when scripts run subscripts
var _global = {}

// The function for '#D'.
// console.log's the input, and also disables output using 'return'
function _dlog(m) {
	console.log(m);
	retout = false;
}

// Read the file and replace the main anonymous function with a function called 'main'.
var contents = fs.readFileSync(file).toString().replace("function", "function main");

// Replace '#s.' (a script call) with 'scripts.'
// e.g. #s.accts.balance(); -> scripts.accts.balance();
contents = contents.replace(/#s\./g, "_scripts.");

// Replace '#D(' (debug output) with 'dlog('
// '#D' disables return output.
// e.g. #D("Test message"); -> dlog("Test message");
contents = contents.replace(/#D\(/g, "_dlog(");

// Replace '#G.' (global object) with '_global.'
// e.g. #G.data = {}; -> _global.data = {};
contents = contents.replace(/#G./g, "_global.")

// Define the args and context objects
// TODO: allow the user to change args
var args = config.args || undefined;
var context = config.context;
context.caller = username;

// Evaluate the contents of the file to get access to the 'main' function of the script.
eval(contents);

try {
	// Store the return output of the script.
	var out = main(context, args);
} catch(e) {
	console.log("::TRUST COMMUNICATION:: " + e);
	process.exit(0);
}


// Only console.log the output of the script if it does not use #D in it.
if(retout) {
	if(typeof out == "object") {
		// If the output of the script is an object, get the 'ok' value of that
		// and add 'Success' or 'Failure' to the output, depending on the value of 'ok'
		let o = "";
		if(out.ok == true) {
			o += "Success\n";
		} else {
			o += "Failure\n";
		}
		if(typeof out.msg == "object") {
			out.msg = JSON.stringify(out.msg);
		}
		o += out.msg;
		console.log(o);
	} else {
		// If the output of the script isn't an object, just console.log the output.
		console.log(out);
	}
}
