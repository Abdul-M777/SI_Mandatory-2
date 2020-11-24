module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    // This variable contains the amount it got from the skat api.
    const money = (req.query.money || (req.body && req.body.money));
    const taxPercentage = 0.10;
    // The tax money is original amount * taxpercentage.
    const taxMoney = parseFloat(money) * taxPercentage;
    // Check if money is below 0.
    if (money < 0) {
        // if true we get status code 404 NOT FOUND.
        context.res = {
            status: 404,
            body: "Amount can not be negative"
        };
    }
    context.res = {
        // If not true then we get the status code 200 OK.
        status: 200,
        body: taxMoney
    };
}