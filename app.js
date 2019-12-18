window.onload = function () {

    const AA_address = '3V64CVUTCNTPE7M3EY7E5LDKWH6SR6RW';
    const testnet = true;


    const options = { testnet };
    const client = new obyte.Client(`wss://obyte.org/bb${testnet ? '-test' : ''}`, options);
    const params = {
        address: AA_address
    };

    const open = document.getElementById('open');
    const search = document.getElementById('search');
    open.addEventListener('click', event => {
        const amountInput = document.getElementById('amount');
        const amountStatus = document.getElementById('amount-status');
        const amount = amountInput.value;
        amountInput.classList.remove('is-danger');
        if (amount && amount >= 100000) {
            client.api.getAaStateVars(params, function (err, result) {
                if (result.no_asset && result.yes_asset) {
                    if (!result.winner) {
                        window.location = `byteball${testnet ? '-tn' : ''}:${AA_address}?amount=${amount}&amp;asset=base`;
                    } else {
                        amountInput.classList.add('is-danger');
                        amountStatus.innerText = 'Winner has been selected';
                    }
                } else {
                    amountInput.classList.add('is-danger');
                    amountStatus.innerText = 'No assets created';
                }
            })
        } else {
            amountInput.classList.add('is-danger');
            amountStatus.innerText = 'The minimum amount is 100,000 bytes';
        }

    });


    search.addEventListener('click', event => {
        const addressInput = document.getElementById('address')
        const address = addressInput.value;
        addressInput.classList.remove('is-danger')

        if (obyte.utils.isValidAddress(address)) {
            client.api.getAaStateVars(params, function (err, result) {
                const info = document.getElementById('info');
                if (result.no_asset && result.yes_asset) {
                    if (result.winner) {
                        const { no_asset, yes_asset, winner } = result;
                        client.api.getBalances([address], function (err, balance) {
                            if (balance && balance[address] && (balance[address][yes_asset] || balance[address][no_asset])) {
                                const winnerAsset = winner === 'yes' ? yes_asset : no_asset;
                                let btn = '';
                                if (balance[address][winnerAsset] && balance[address][winnerAsset].stable > 0) {
                                    btn = `<a class="button is-light btn-exchange" 
                                    href="byteball${testnet ? '-tn' : ''}:${AA_address}?amount=10000&asset=${encodeURIComponent(no_asset)}">
                                    Exchange for bytes
                                    </a>`;
                                }
                                const status = `
                                <b>Winning asset:</b>
                                ${winner === 'yes' ? 'yes_asset' : 'no_asset'}<br />
                                <b> Balance:</b> <br />
                                 yes_asset: ${(balance[address][yes_asset] ? balance[address][yes_asset].stable : 0)} <br />
                                 no_asset: ${(balance[address][no_asset] ? balance[address][no_asset].stable : 0)}<br />
                                 ${btn}
                                `;
                                info.classList.add('box');
                                info.innerHTML = status;
                            } else {
                                info.classList.add('box');
                                info.innerHTML = "You did not buy assets";
                            }
                        });
                    } else {
                        info.classList.add('box');
                        info.innerHTML = "The winner has not yet been chosen";
                    }

                } else {
                    info.classList.add('box');
                    info.innerHTML = "No assets created";
                }
            });
        } else {
            const addressStatus = document.getElementById('address-status');
            addressInput.classList.add('is-danger');
            addressStatus.innerHTML = "Adress is not valid";
        }
    })

};