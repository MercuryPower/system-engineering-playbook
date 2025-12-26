export default function(ar1, ar2) {
    if (ar1.lenght !== ar2.lenght) {
        console.error('arrays length must be equal');
        return null;
    }

    return ar1.map((el1, i) => {
        return el1 - ar2[i];
    });
}