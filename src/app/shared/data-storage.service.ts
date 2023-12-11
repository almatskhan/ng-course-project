import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { exhaustMap, map, take, tap } from 'rxjs/operators';
import { RecipeService } from '../recipes/recipe.service';
import { Recipe } from "../recipes/recipe.model";
import { AuthService } from '../auth/auth.service';

@Injectable({providedIn: 'root'})
export class DataStorageService {
    constructor(
        private http: HttpClient,
        private recipeService: RecipeService,
        private authService: AuthService
    ) {}

    storeRecipes() {
        const recipes = this.recipeService.getRecipes()
        this.http.put('https://ng-course-recipe-book-ad268-default-rtdb.firebaseio.com/recipes.json', recipes)
            .subscribe((response) => {
                console.log(response);
                
            })
    }

    fetchRecipes() {
        return this.http
            .get<Recipe[]>(
                'https://ng-course-recipe-book-ad268-default-rtdb.firebaseio.com/recipes.json'
            ).pipe(
                map((recipes) => { //rxjs map
                    return recipes.map(
                        (recipe) => { //regular js map
                            return {...recipe, ingredients: recipe.ingredients ? recipe.ingredients : []}
                        })
                    }
                ),
                tap((recipes: Recipe[]) => {
                    this.recipeService.setRecipes(recipes)
                })
            )
    }
}