import { Component } from "@angular/core";
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter, map, switchMap, tap } from "rxjs";
import { Item } from "src/app/models/interfaces";
import { LivroVolumeInfo } from 'src/app/models/livroVolumeInfo';
import { LivroService } from "src/app/service/livro.service";

const PAUSA = 400;
@Component({
  selector: "app-lista-livros",
  templateUrl: "./lista-livros.component.html",
  styleUrls: ["./lista-livros.component.css"],
})
export class ListaLivrosComponent {
  
  campoBusca = new FormControl

  constructor(private service: LivroService) { }

  //MARK: o $ é uma convencao da comunidade usar o $ no final da variavel quando essa varialvel apresenta um observable
  livrosEncontrados$ = this.campoBusca
      .valueChanges
        .pipe(
          debounceTime(PAUSA),
          filter((valorDigitado) => valorDigitado.length >= 3),
          tap(() => console.log('fluxo inicial')),
          distinctUntilChanged(),
          switchMap((valorDigitado) => this.service.buscar(valorDigitado)),
          tap((retornoAPI) => console.log(retornoAPI)),
          map((items) => this.livrosResultadoParaLivros(items))
        )

  livrosResultadoParaLivros(items: Item[]): LivroVolumeInfo[] {
    return items.map(item => {
      return new LivroVolumeInfo(item)
    })
  } 
}


// OBS: Nesse metodo abaixo, o pipe vai entrar na requisicao a cada tecla digitada
// e ao apagar vai causa um erro de request na url pois nao esta filtrado
// por isso de vemos usar o filter pra termos mais precisao na aplicacao 
// filter((valorDigitado) => valorDigitado.length >= 3),
//
// livrosEncontrados$ = this.campoBusca
//       .valueChanges
//         .pipe(
//           tap(() => console.log('fluxo inicial')),
//           switchMap((valorDigitado) => this.service.buscar(valorDigitado)),
//           tap(() => console.log('req serv')),
//           map((items) => this.livrosResultadoParaLivros(items))
//         )
