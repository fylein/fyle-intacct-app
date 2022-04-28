import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'search'
})
export class SearchPipe implements PipeTransform {

  transform(value: any, ...args: any[]): any {
    if (value && args && args.length && args[0]) {
      const searchText = args[0].toLowerCase();
      return value.filter((item: any) => {
        return item.name.toLowerCase().includes(searchText);
      });
    }
    return value;
  }

}
