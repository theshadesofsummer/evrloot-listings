const { postListing } = require('./discord-bot.js')
const { getItemMetadata, getSoulMetadata, getSoulChildrenMetadata} = require("./evrloot-ipfs");
const createSoulSalesEmbed = require('./embeds/sales/soul-embed')
const createItemSalesEmbed = require('./embeds/sales/item-embed')
const { getPriceOfRmrk, getPriceOfGlmr } = require("./fetch-prices");

const SOUL_COLLECTION = '0x9d1454e198f4b601bfc0069003045b0cbc0e6749'
const ITEM_COLLECTION = '0x29b58a7fceecf0c84e62301e5b933416a1db0599'
const CRAFTED_ITEM_COLLECTION = '0x2931b4e6e75293f8e94e893ce7bdfab5521f3fcd'

module.exports = {
    publishSale
}

async function publishSale(event) {
    console.log('publish direct sale')
    const id = event.returnValues.tokenId;
    const collection = event.returnValues.tokenAddress.toLowerCase();
    //const paymentOption = event.returnValues.currency;
    const priceInGwei = event.returnValues.totalPricePaid //price in hex rmrk: 10decimals, gmlr: 18 decimals
    console.log('id', id)
    console.log('collection', collection)
    //console.log('paymentOption', paymentOption)
    console.log('priceInGwei', priceInGwei)

    const readablePriceInRmrk = Math.round((priceInGwei / Math.pow(10, 10)) * 100) / 100
    const readablePriceInGlmr = Math.round((priceInGwei / Math.pow(10, 18)) * 100) / 100

    let usdPriceInRmrk = await getPriceOfRmrk(readablePriceInRmrk);
    let usdPriceInGlmr = await getPriceOfGlmr(readablePriceInGlmr);

    usdPriceInRmrk = Math.round(usdPriceInRmrk * 100) / 100;
    usdPriceInGlmr = Math.round(usdPriceInGlmr * 100) / 100;
    const prices = {
        rmrk: readablePriceInRmrk,
        rmrkUsd: usdPriceInRmrk,
        glmr: readablePriceInGlmr,
        glmrUsd: usdPriceInGlmr
    }


    if (collection === SOUL_COLLECTION) {
        const soul = await getSoulMetadata(id);
        const soulChildren = await getSoulChildrenMetadata(soul.children);
        await postListing(createSoulSalesEmbed(soul, soulChildren, prices))
    } else if (collection === ITEM_COLLECTION) {
        const itemMetadata = await getItemMetadata(id, false);
        await postListing(createItemSalesEmbed(id, itemMetadata, false, prices))
    } else if (collection === CRAFTED_ITEM_COLLECTION) {
        const itemMetadata = await getItemMetadata(id, true);
        await postListing(createItemSalesEmbed(id, itemMetadata, true, prices))
    }

}