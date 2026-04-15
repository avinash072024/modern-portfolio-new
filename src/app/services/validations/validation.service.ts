import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ValidationService {
  constructor() { }

  // Allow only characters (A-Z, a-z, space)
  onlyCharacters(value: string): string {
    return value.replace(/[^a-zA-Z ]/g, '');
  }

  // Allow only numbers (0-9)
  onlyNumbers(value: string): string {
    return value.replace(/[^0-9]/g, '');
  }

  // Capitalize each word
  capitalizeFirstLetter(value: string): string {
    return value
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  // Capitalize after period
  capitalizeSentence(value: string): string {
    return value
      .toLowerCase()
      .split('. ')
      .map(sentence => sentence.charAt(0).toUpperCase() + sentence.slice(1))
      .join('. ');
  }
}
