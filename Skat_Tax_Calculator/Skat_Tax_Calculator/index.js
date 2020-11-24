module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    const money = (req.query.money || (req.body && req.body.money));
    const taxPercentage = 0.10;
    const taxMoney = parseFloat(money) * taxPercentage;
    if (money < 0) {
        context.res = {
            status: 404,
            body: "Amount can't be negative"
        };
    }
    context.res = {
        status: 200,
        body: taxMoney
    };
}