export const calculateTotalRemaining = (totalPrice, totalSpend) => {
    const price = totalPrice;
    const spend = totalSpend;

    if (price !== undefined && spend !== undefined) {
        return price - spend;
    }
    return 0;
};

export const calculatePorcent = (teamEmployees, value, key) => {
    if (!Array.isArray(teamEmployees)) {
        return;
    }
    let employeesSalary = teamEmployees.find(item => item.id == parseInt(key));
    if (!employeesSalary) {
        return;
    }
    if (!employeesSalary.actual_external_data || !employeesSalary.actual_external_data.annual_salary) {
        return;
    }
    let salary = employeesSalary.actual_external_data.annual_salary;
    const montoSinFormato = salary.replace(/\$|,/g, '');
    const montoNumero = parseFloat(montoSinFormato);
    if (isNaN(montoNumero)) {
        return;
    }
    const result = (montoNumero * value) / 100;
    console.log(`Calculando porcentaje para ${key}:`, result); // Agrega este log
    return result;
}

export const calculateTotalPrice = (updatedRangeValues) => {
    let totalPrice = 0;
    for (const key in updatedRangeValues) {
        const percentValue = updatedRangeValues[key];
        totalPrice += percentValue;
    }
    return { totalPrice };
}

export const calculateTotalsByEmployee = (updatedRangeValues) => {
    const totalByEmployees = {};

    for (const key in updatedRangeValues) {
        const [currentRatingsId, currentEmployeeId] = key.split('-');
        const currentValue = parseInt(updatedRangeValues[key], 10);
        if (!totalByEmployees[currentEmployeeId]) {
            totalByEmployees[currentEmployeeId] = 0;
        }
        totalByEmployees[currentEmployeeId] += currentValue;
    }
    return { totalByEmployees };
};

export const calculateTotalsPercentEmployee = (updatedPercentValues) => {
    let totalPercentSum = 0;

    for (const key in updatedPercentValues) {
        const percentValue = updatedPercentValues[key];
        totalPercentSum += percentValue; // Suma el valor al total
    }
    return { totalPercentSum };

};
