var fs = require("fs");
if(!fs.existsSync("code.js")) {
	console.log("The script should be called 'code.js' in the same folder as 'app.js'.");
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
function getSeclevelName(i) {
	return ["NULLSEC", "LOWSEC", "MIDSEC", "HIGHSEC", "FULLSEC"][i];
}
// Scripts the code will have access to.
// TODO: make each script an object with '_seclevel' and 'call'
// the script will show as the lowest seclevel from the scripts called.
var scripts = {
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
			return seclevels[a[0]][a[1]];
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
var seclevels = {
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
	}
}
// Read the file and replace the main anonymous function with a function called 'main'.
// Also replace '#s' (a script call) with 'scripts'
// e.g. #s.accts.balance(); -> scripts.accts.balance();
var contents = fs.readFileSync("code.js").toString().replace("function", "function main").replace(/#s/g, "scripts");
// Evaluate the contents of the file to get access to the 'main' function of the script.
eval(contents);
// console.log the return of the main function. makes 'return' act as it does in hackmud.
console.log(main());
 