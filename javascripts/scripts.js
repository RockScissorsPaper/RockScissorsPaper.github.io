// const contractAddress = "n1SAeQRVn33bamxN4ehWUT7JGdxipwn8b17"; //from example api documentation
const contractAddress = "n229G5JMwZQatvZxX7KJGx33TjQRE9EH86A"; //rockpaper testnet 
const nebRequest = "https://testnet.nebulas.io";
const nonce = 192812;
const gasPrice = 1000000;
const gasLimit = 2000000;

$(function() {
    $(document).on('.data-api');
    $("#keystore").on("click", onClickKeystore);
    $("#togglePassword").on("change", onChangeTogglePassword);
    

    // Nebulas stuff
    var HttpRequest = require("nebulas").HttpRequest;
    var nebulas = require("nebulas");
    var Utils = nebulas.Utils;
    var Neb = require("nebulas").Neb;
    var Account = require("nebulas").Account;
    var Transaction = require("nebulas").Transaction;
    var neb = new Neb();
    neb.setRequest(new HttpRequest(nebRequest));
    var account, tx, txhash;
    var api = neb.api;
    var chainID = 1;
    var gAccount;
    var gFileJson;
    var yourWalletAddress;

    // api.getAccountState({address: "n1QsosVXKxiV3B4iDWNmxfN4VqpHn2TeUcn"}).then(function(state) {
    //     console.log(state);
    // });
    api.getNebState().then(function(state) {
        console.log(state);
        chainID = parseInt(state["chain_id"]);
        console.log(chainID);
    }).catch((err) => {
        // console.log(err);
        showAlert(err);
    });

    // WALLET
    uiBlock.insert({
        selectWalletFile: [".select-wallet-file", onUnlockFile]
    });
    
    function onUnlockFile(swf, fileJson, account, password) {
        try {
            gAccount = account;
            gFileJson = fileJson;
            account.fromKey(fileJson, password);

            yourWalletAddress = account.getAddressString();
    
            $("#address").val(account.getAddressString());
            $("#sideaddress").text(account.getAddressString());
            $("#password").val(account.getPrivateKeyString());
            $("#addressqr").html('').qrcode(account.getAddressString());
            $("#privateqr").html('').qrcode(account.getPrivateKeyString());
            $("#walletinfo").show();
    
            neb.api.getAccountState(account.getAddressString())
                .then(function (resp) {
                    if (resp.error) {
                        // throw new Error(resp.error);
                        showAlert(resp.error);
                    } else {
                        $("#amount").val(nebulas.Unit.fromBasic(Utils.toBigNumber(resp.balance), "nas").toNumber() + " NAS");
                    }
                })
                .catch(function (e) {
                    // this catches e thrown by nebulas.js!neb
                    showAlert(e.message);
                    // bootbox.dialog({
                    //     backdrop: true,
                    //     onEscape: true,
                    //     message: i18n.apiErrorToText(e.message),
                    //     size: "large",
                    //     title: "Error"
                    // });
                });
        } catch (e) {
            // this catches e thrown by nebulas.js!account
            showAlert(e);
            // bootbox.dialog({
            //     backdrop: true,
            //     onEscape: true,
            //     message: localSave.getItem("lang") == "en" ? e : "keystore 文件错误, 或者密码错误",
            //     size: "large",
            //     title: "Error"
            // });
        }
    }

    function onClickKeystore() {
        var blob = new Blob([JSON.stringify(gFileJson)], { type: "application/json; charset=utf-8" });
        saveAs(blob, gAccount.getAddressString());
    }    

    $(".start-battle").click(function() {
        createDuel();
    });
    $(".fight-button").click(function() {
        var $this = $(this);
        var duelAddress = $this.data("address");
        joinDuel(duelAddress);
    });
    $("#fight").click(function() {
        // Get values
        // var yourWalletAddress = $("#yourWalletAddress").val();
        var address = $("#address").val();
        var amount = $("#betAmount").val();
        var choice = $('input[name="choice-options"]:checked').val();
        if (amount && amount.trim() != "" && isPositiveInteger(amount.trim())) {
            amount = parseInt(amount);
            if (choice && choice.trim() != "") {
                // if (yourWalletAddress && yourWalletAddress != "") {
                    // yourWalletAddress = "n1QsosVXKxiV3B4iDWNmxfN4VqpHn2TeUcn";
                    api.getAccountState({address: yourWalletAddress}).then(function(state) {
                        console.log(state);

                        var player1_choice = choice;
                        var player1_secret = "8a9sdu983242";
                        var hash_input = player1_choice + player1_secret;
                        var player1_encrypted_choice = "" + _hash(hash_input);
                        // 0 = not set, 1 = Rock, 2 = Paper, 3 = Scissors

                        console.log(player1_choice, player1_secret, hash_input, player1_encrypted_choice);

                        var callParamsObj = {
                            chainID: chainID,
                            from: yourWalletAddress,
                            to: contractAddress,
                            value: amount,
                            nonce: parseInt(state["nonce"])+1,
                            gasPrice: gasPrice,
                            gasLimit: gasLimit,
                            contract: {
                                function: "create_game",
                                args: JSON.stringify([player1_encrypted_choice, 0])
                            }
                        };

                        if (state && state.balance > amount) {

                            // api.call(callParamsObj).then(function(tx) {
                            //     console.log(tx);
                            //     goToResultsPage();
                            // }).catch((err) => {
                            //     console.log(err);
                            //     showAlert(err);
                            // });
                            var key = {"version":4,"id":"12c21887-c969-4287-99bd-eb9cfa7ede56","address":"n1EdY7FnXvYqSG9zT68rnbBRfCXiXAVDfss","crypto":{"ciphertext":"780edaa8df0116a466209fba7b34d258709678b18efbae3a8bd36344db958f7c","cipherparams":{"iv":"2c777bc9a5c5a6df028a6f7ea8454728"},"cipher":"aes-128-ctr","kdf":"scrypt","kdfparams":{"dklen":32,"salt":"2eab24506cbd99c203fa1b7e1bcbd1f79d76c11566578302e121e7c87e2d1334","n":4096,"r":8,"p":1},"mac":"73a75fd410e71d6943b087661b8ba9292a12c43b5449809525c87a19fdcf85ce","machash":"sha3256"}};

                            var account = Account.fromAddress(yourWalletAddress);
                            //account.setPrivateKey("780edaa8df0116a466209fba7b34d258709678b18efbae3a8bd36344db958f7c");
                            account.fromKey(key, "newpassword", false);

                            // var contractAccount = Account.fromAddress(contractAddress);

                            
                            callParamsObj["from"] = account;
                            // callParamsObj["to"] = contractAccount;

                            var tx = new Transaction(callParamsObj);
                            tx.signTransaction();
                            neb.api.sendRawTransaction(tx.toProtoString()).then(function(resp) {
                                console.log(resp);
                                resp = resp.result || resp;
                                txhash = resp.txhash;
                                console.log("txhash " + txhash);
                            }).catch((err) => {
                                console.log(err);
                                showAlert(err);
                            });

                        } else {
                            showAlert("Not enough balance in your wallet.");
                        }
                    }).catch((err) => {
                        console.log(err);
                        showAlert(err);
                    });
                // } else {
                    // showAlert("Your wallet address is required.");
                // }
            } else {
                showAlert("Please choose a throw!");
            }
        } else {
            showAlert("Please enter a valid amount.");
        }

    });
});


function _hash(input) {
    var hash = 0;
    if (input.length === 0) return hash;
    for (var i = 0; i < input.length; i++) {
        var char = input.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }

    return hash;
}

function onChangeTogglePassword(e) {
    if (e.target.checked) {
        $("#password").prop("type", "text");
        $(".key_qr").removeClass("display-none");
    } else {
        $("#password").prop("type", "password");
        $(".key_qr").addClass("display-none");
    }
}

function isPositiveInteger(n) {
    return n == "0" || ((n | 0) > 0 && n % 1 == 0);
}

function joinDuel(duelAddress) {
    //TODO: (tarun) Use the duel address
    $(".create-duel-label").hide();
    $(".duel-label").show();
    setDuelAddress(duelAddress);
    goToBattlePage();
}

function createDuel() {
    $(".create-duel-label").show();
    $(".duel-label").hide();
    goToBattlePage();
}

function setDuelAddress(address) {
    $(".duel-address").html(address);
}

function duel(address) {
    $(".duel-address").html(address);
    $(".duel-label").show();
}

function saveData() {
    //TODO: (tarun) SAVE SECRET OR OTHER DATA
    //Cookies.set('name', 'value');
}

function getData() {
    //TODO: (tarun) SAVE SECRET OR OTHER DATA
    //Cookies.get('name');
}

function goToBattlePage() {
    $(".page").hide();
    $("#vs").show();
}

function goToWaitingPage() {
    $(".page").hide();
    $("#waiting").show();
}

function goToResultsPage() {
    var win = true; //Assume win is true for testing
    // Display results
    $(".page").hide();
    $("#results").show();
    $(".results-win").toggle(win);
    $(".results-lost").toggle(!win);
}

function showAlert(message) {
    $('.alert-content').html(message);
    $('#alert').modal({"backdroup": true});
}

// Confetti

let W = window.innerWidth;
let H = window.innerHeight;
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
const maxConfettis = 50;
const particles = [];

const possibleColors = [
    "DodgerBlue",
    "OliveDrab",
    "Gold",
    "Pink",
    "SlateBlue",
    "LightBlue",
    "Gold",
    "Violet",
    "PaleGreen",
    "SteelBlue",
    "SandyBrown",
    "Chocolate",
    "Crimson"
];

function randomFromTo(from, to) {
    return Math.floor(Math.random() * (to - from + 1) + from);
}

function confettiParticle() {
    this.x = Math.random() * W; // x
    this.y = Math.random() * H - H; // y
    this.r = randomFromTo(11, 33); // radius
    this.d = Math.random() * maxConfettis + 11;
    this.color =
    possibleColors[Math.floor(Math.random() * possibleColors.length)];
    this.tilt = Math.floor(Math.random() * 33) - 11;
    this.tiltAngleIncremental = Math.random() * 0.07 + 0.05;
    this.tiltAngle = 0;

    this.draw = function() {
        context.beginPath();
        context.lineWidth = this.r / 2;
        context.strokeStyle = this.color;
        context.moveTo(this.x + this.tilt + this.r / 3, this.y);
        context.lineTo(this.x + this.tilt, this.y + this.tilt + this.r / 5);
        return context.stroke();
    };
}

function Draw() {
    const results = [];

    // Magical recursive functional love
    requestAnimationFrame(Draw);

    context.clearRect(0, 0, W, window.innerHeight);

    for (var i = 0; i < maxConfettis; i++) {
    results.push(particles[i].draw());
    }

    let particle = {};
    let remainingFlakes = 0;
    for (var i = 0; i < maxConfettis; i++) {
    particle = particles[i];

    particle.tiltAngle += particle.tiltAngleIncremental;
    particle.y += (Math.cos(particle.d) + 3 + particle.r / 2) / 2;
    particle.tilt = Math.sin(particle.tiltAngle - i / 3) * 15;

    if (particle.y <= H) remainingFlakes++;

    // If a confetti has fluttered out of view,
    // bring it back to above the viewport and let if re-fall.
    if (particle.x > W + 30 || particle.x < -30 || particle.y > H) {
        particle.x = Math.random() * W;
        particle.y = -30;
        particle.tilt = Math.floor(Math.random() * 10) - 20;
    }
    }

    return results;
}

window.addEventListener(
    "resize",
    function() {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    },
    false
);

// Push new confetti objects to `particles[]`
for (var i = 0; i < maxConfettis; i++) {
    particles.push(new confettiParticle());
}

// Initialize
canvas.width = W;
canvas.height = H;
Draw();


// 
