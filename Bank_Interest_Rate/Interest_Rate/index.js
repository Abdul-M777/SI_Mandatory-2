module.exports = async function (context, req) {
    // Here We have the deposit amount which we received from the bank api.
    const depositAmount = (req.body && req.body.depositAmount);
    // Here we do the interest rate.
    const interestRate = depositAmount * 0.02;
    // Here we add the interest to the deposit amount.
    const newDepositAmount = depositAmount + interestRate;
    context.res = {
        // we get status code 200 OK.
        status: 200,
        body: newDepositAmount
    };
}