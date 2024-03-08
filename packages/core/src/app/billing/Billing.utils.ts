import { Address } from "@bigcommerce/checkout-sdk";
import { TAX_NUMBER_FIELD_NAME } from "./Billing.config";

// TODO: Add unit tests for both functions
const addTaxNumberToAddress = (address: Address, taxNumber: string = ''): Address => {
    const { customFields: customFieldsCopy } = Object.assign({}, address)
    const taxNumberFieldIndex = customFieldsCopy.findIndex(field => field.fieldId === TAX_NUMBER_FIELD_NAME)
    
    customFieldsCopy.splice(
        taxNumberFieldIndex,
        1,
        {
            fieldId: TAX_NUMBER_FIELD_NAME,
            fieldValue: taxNumber
        })

    return {
        ...address,
        customFields: customFieldsCopy
    }
}

const extractTaxNumber = (address?: Address): string => {
    if (address) {
        return String(address?.customFields?.find(field => field.fieldId === TAX_NUMBER_FIELD_NAME)?.fieldValue) || ''
    }
    return ''
}

export {
    addTaxNumberToAddress,
    extractTaxNumber
}