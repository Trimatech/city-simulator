import { createProducer } from "@rbxts/reflex";

export interface BudgetState {
	readonly funds: number;
	readonly taxRate: number;
	readonly roadFunding: number;
	readonly policeFunding: number;
	readonly fireFunding: number;
	readonly totalIncome: number;
	readonly totalExpenses: number;
}

const initialState: BudgetState = {
	funds: 20000,
	taxRate: 7,
	roadFunding: 100,
	policeFunding: 100,
	fireFunding: 100,
	totalIncome: 0,
	totalExpenses: 0,
};

export const budgetSlice = createProducer(initialState, {
	setFunds: (state, funds: number) => ({ ...state, funds }),
	addFunds: (state, amount: number) => ({ ...state, funds: state.funds + amount }),
	subtractFunds: (state, amount: number) => ({ ...state, funds: state.funds - amount }),
	setTaxRate: (state, taxRate: number) => ({ ...state, taxRate: math.clamp(taxRate, 0, 20) }),
	setRoadFunding: (state, roadFunding: number) => ({ ...state, roadFunding: math.clamp(roadFunding, 0, 100) }),
	setPoliceFunding: (state, policeFunding: number) => ({
		...state,
		policeFunding: math.clamp(policeFunding, 0, 100),
	}),
	setFireFunding: (state, fireFunding: number) => ({ ...state, fireFunding: math.clamp(fireFunding, 0, 100) }),
	setBudgetTotals: (state, totalIncome: number, totalExpenses: number) => ({
		...state,
		totalIncome,
		totalExpenses,
	}),
	resetBudget: () => initialState,
});
