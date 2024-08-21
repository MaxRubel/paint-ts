const pow = (base, n) => {
    if (n===1){
        return base;
    }
    return base * pow(base, n-1)
}

pow(3, 2)