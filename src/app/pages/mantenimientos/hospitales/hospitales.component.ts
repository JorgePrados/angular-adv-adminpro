import { Component, OnInit, OnDestroy } from '@angular/core';
import { Hospital } from 'src/app/models/hospital.model';
import { HospitalService } from 'src/app/services/hospital.service';
import { ModalImagenService } from 'src/app/services/modal-imagen.service';
import { Subscription, delay } from 'rxjs';
import { BusquedasService } from 'src/app/services/busquedas.service';

@Component({
  selector: 'app-hospitales',
  templateUrl: './hospitales.component.html',
  styles: []
})

export class HospitalesComponent implements OnInit, OnDestroy {
  public hospitales:Hospital[] = [];
  public cargando: boolean = true;
  private imgSubs: Subscription;

  constructor(private hospitalSevice: HospitalService, 
              private modalImagenService: ModalImagenService, 
              private busquedasService: BusquedasService ) { }

  ngOnDestroy(): void {
    this.imgSubs.unsubscribe();
  }

  ngOnInit() {
    this.cargarHospitales();

    this.imgSubs = this.modalImagenService.nuevaImagen
        .pipe(delay(100))
        .subscribe(img => this.cargarHospitales());
  }

  buscar ( termino: string) {

    if(termino.length === 0){
      return this.cargarHospitales();
    }

    this.busquedasService.buscar( 'hospitales', termino)
        .subscribe(resultados => {
          this.hospitales = resultados;
        });
  }

  cargarHospitales(){
    this.cargando = true;
    this.hospitalSevice.cargarHospitales()
        .subscribe( hospitales => {
          this.cargando = false;
          this.hospitales = hospitales;
        });
  }

  guardarCambios(hospital: Hospital){
    this.hospitalSevice.actualizarHospital(hospital._id, hospital.nombre)
          .subscribe(resp => {
            Swal.fire('Actualizado', hospital.nombre, 'success');
          });
  }

  eliminarHospital(hospital: Hospital){
    this.hospitalSevice.eliminarHospital(hospital._id)
          .subscribe(resp => {
            this.cargarHospitales();
            Swal.fire('Borrado', hospital.nombre, 'success');
          });
  }

  async abrirSweetAlert() {
    const { value = '' } = await Swal.fire<string>({
      title: 'Crear hospital',
      text: 'Ingrese el nombre del nuevo hospital',
      input: 'text',
      inputPlaceholder: 'Enter the URL',
      showCancelButton: true
    })
    
    if(value.trim().length > 0) { 
      this.hospitalSevice.crearHospital(value)
          .subscribe((resp: any) => {
            this.hospitales.push(resp.hospital);
          })
    }
    
  }

  abrirModal(hospital: Hospital){
    this.modalImagenService.abrirModal('hospitales', hospital._id, hospital.img);

  }
}