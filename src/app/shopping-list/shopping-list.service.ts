import { Injectable, Output } from "@angular/core";
import { Subject } from 'rxjs';

import { Ingredient } from '../shared/ingredient.model';

@Injectable()
export class ShoppingListService {
    ingredientsChanged = new Subject<Ingredient[]>()
    startedEditing = new Subject<number>()
    private ingredients: Ingredient[] = [
        new Ingredient('Apples', 5),
        new Ingredient('Tomatoes', 10)
    ]

    getIngredients() {
        return this.ingredients.slice()
    }

    getIngredient(index: number) {
        return this.ingredients[index]
    }
    
    addIngredient(ingredient: Ingredient) {
        !this.isDuplicate(ingredient) ? this.ingredients.push(ingredient) : null
        this.ingredientsChanged.next(this.ingredients.slice())
    }

    addIngredients(ingredients: Ingredient[]) {
        // for (let i = 0; i < ingredients.length; i++) {
        //     this.slService.addIngredient(ingredients[i])
        // }
        let uniqueIngredients: Ingredient[] = this.addUpDuplicates(ingredients)
        this.ingredients.push(...uniqueIngredients)
        this.ingredientsChanged.next(this.ingredients.slice())
    }

    addUpDuplicates(ingredients: Ingredient[]): Ingredient[] {
        let uniqueIngredients: Ingredient[] = []

        // for (let ing in uniqueIngredients) {
        //     console.log(uniqueIngredients[ing].name);
        // }
        for (let i = 0; i < ingredients.length; i++) {
            if (!this.isDuplicate(ingredients[i])) {
                uniqueIngredients.push(ingredients[i])
            }
        }

        return uniqueIngredients
    }

    isDuplicate(ingredient: Ingredient): boolean {
        for (let i = 0; i < this.ingredients.length; i++) {
            if (ingredient.name.toUpperCase() == this.ingredients[i].name.toUpperCase()) {
                this.ingredients[i].amount += ingredient.amount
                return true
            }
        }
        return false
    }

    updateIngredient(index: number, newIngredient: Ingredient) {
        this.ingredients[index] = newIngredient
        this.ingredientsChanged.next(this.ingredients.slice())
    }

    deleteIngredient(index: number) {
        this.ingredients.splice(index, 1)
        this.ingredientsChanged.next(this.ingredients.slice())
    }
}