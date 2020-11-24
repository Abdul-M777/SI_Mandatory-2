module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    const loan = (req.query.loan || (req.body && req.body.loan));
    const totalAccountAmount = (req.query.totalAccountAmount || (req.body && req.body.totalAccountAmount));
    let responsemessage = "";
    
    console.log("loan", loan);
    console.log("totalAccountAmount", totalAccountAmount);
    console.log("total Amount =", totalAccountAmount *0.75);

    if (loan > totalAccountAmount * 0.75) {
        responsemessage = "Can not give you a loan, Sorry";
        context.res = {
            status: 403,
            body: responsemessage
        };
    } else {
        responsemessage = "Loan Accepted";
        context.res = {
            status: 200,
            body: responsemessage
        };
    }
}