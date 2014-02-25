define(function() {
    return {
        typeName: 'ingredientFirmenich',
        structure: {
            type: "object",
            elements: {
                name: "string",
                description: "string",
                synonyms: {
                    type: "array",
                    elements: "string"
                },
                registry: {
                    type: "object",
                    elements: {
                        rn: {
                            type: "array",
                            elements: "string"
                        },
                        fema: {
                            type: "array",
                            elements: "number"
                        }
                    }
                },
                molecule: "mol2d",
                iid: "number",
                info: {
                    type: "object",
                    elements: {
                        captif: "number",
                        natural: "string",
                        isFlavor: "boolean",
                        isPerfume: "boolean"
                    }
                },
                safety: "object",
                stability: "array",
                physchem: {
                    type: "object",
                    elements: {
                        logodt: "array",
                        curve: "array",
                        ipower: "array",
                        theta: "array",
                        logp: "array",
                        shape: "array",
                        middle: "array",
                        volatility: "array",
                        gcpolar: "array",
                        gcapolar: "array",
                        logov: "array",
                        tenacity: "array",
                        lift: "array",
                        bottom: "array",
                        power: "array",
                        imax: "array",
                        top: "array"
                    }
                },
                olfaction: {
                    type: "object",
                    elements: {
                        original: {
                            type: "object",
                            elements: {
                                position: "array",
                                values: "array",
                                colorbar: "colorBar"
                            }
                        },
                        extension: {
                            type: "object",
                            elements: {
                                position: "array",
                                values: "array",
                                colorbar: "colorBar"
                            }
                        },
                        familyExtension: {
                            type: "object",
                            elements: {
                                position: "array",
                                values: "array",
                                colorbar: "colorBar"
                            }
                        }
                    }
                },
                trends: "object"
            }
        }
    };
});
