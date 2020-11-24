module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    // This variable loan amount.
    const loan = (req.query.loan || (req.body && req.body.loan));
    // This variable contains the amount in the account table.
    const AccountAmount = (req.query.AccountAmount || (req.body && req.body.AccountAmount));
    // In this variable we will get the response message.
    let responsemessage = "";
    
    console.log("loan", loan);
    console.log("AccountAmount", AccountAmount);
    console.log("total Amount =", AccountAmount *0.75);

    // We check if the loan exceeds 75% of the account amount.
    if (loan > AccountAmount * 0.75) {
        responsemessage = "We can not give you the loan.";
        context.res = {
            // If true than we get status code 403 Forbidden.
            status: 403,
            body: responsemessage
        };
    } else {
        // If the user can get the loan we get status code 200 OK.
        responsemessage = "Loan Accepted";
        context.res = {
            status: 200,
            body: responsemessage
        };
    }
}