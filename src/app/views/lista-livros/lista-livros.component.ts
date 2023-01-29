import { Component } from "@angular/core";
import { FormControl } from '@angular/forms';
import { catchError, debounceTime, distinctUntilChanged, EMPTY, filter, map, of, switchMap, tap, throwError } from "rxjs";
import { Item, LivrosResultado } from "src/app/models/interfaces";
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
  mensagemErro = ''
  livrosResultado: LivrosResultado

  constructor(private service: LivroService) { }

  totalDeLivros$ = this.campoBusca
  .valueChanges
    .pipe(
      debounceTime(PAUSA),
      filter((valorDigitado) => valorDigitado.length >= 3),
      tap(() => console.log('fluxo inicial')),
      switchMap((valorDigitado) => this.service.buscar(valorDigitado)),
      map(resultado => this.livrosResultado = resultado),
      catchError(erro => {
        console.log(erro)
        return of()
      })
    )
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
          map(resultado => resultado.items ?? []),
          map((items) => this.livrosResultadoParaLivros(items)),
          catchError((erro) => {
            // this.mensagemErro = 'Ops, ocorreu um erro, Recarregue a aplicação!'
            // return EMPTY
            console.log(erro)
            return throwError(() => new Error(
                this.mensagemErro = 'Ops, ocorreu um erro, Recarregue a aplicação!'))
          })
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
