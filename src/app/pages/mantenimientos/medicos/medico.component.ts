import { Component, OnInit } from '@angular/core';
import { Hospital } from 'src/app/models/hospital.model';
import { Medico } from 'src/app/models/medico.model';
import { HospitalService } from 'src/app/services/hospital.service';
import { MedicoService } from 'src/app/services/medico.service';

@Component({
  selector: 'app-medico',
  templateUrl: './medico.component.html',
  styles: []
})

export class MedicoComponent implements OnInit {
  public medicoForm: FormGroup;
  public hospitales: Hospital[];
  public hospitalSeleccionado: Hospital;
  public medicoSeleccionado: Medico;

  constructor(private fb: FormBuilder, private hospitalService: HospitalService, private medicoService: MedicoService, private router: Router, private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe(({ id }) => this.cargarMedico(id));

    this.medicoForm = this.fb.group({
      nombre: ['', Validators.required]
      hospital: ['', Validators.required]
    });

    this.cargarHospitales();

    this.medicoForm.get('hospital').valueChanges
        .subscribe(hospitalId => {
          this.hospitalSeleccionado = this.hospitales.find( h => h._id === hospitalId);
        });
  }

  cargarMedico(id: string){

    if(id === 'nuevo'){
      return;
    }

    this.medicoService.getMedicoById(id)
        .pipe(
          delay(100)
        )
        .subscribe(medico => {
          if(!medico){
            return this.router.navigateByUrl(`/medicos`);
          }

          const {nombre, hospital:{ _id }} = medico;
          this.medicoSeleccionado = medico;
          this.medicoForm.setValue({ nombre, hospital: _id });
        })
  }

  cargarHospitales() {
    this.hospitalService.cargarHospitales()
        .subscribe((hospitales: Hospital[]) => {
          this.hospitales = hospitales;
        })
  }

  guardarMedico(){
    const {nombre} = this.medicoForm.value;
    if(this.medicoSeleccionado) {
      // Actualizar
      const data = {
        ...this.medicoForm.value,
        _id: this.medicoSeleccionado._id;
      }
      this.medicoService.actualizarMedico(data)
          .subscribe(resp => {
            Swal.fire('Actualizado', `${nombre} actualizado correctamente`, 'success');
          });
    } else {
      // Crear
      this.medicoService.crearMedico( this.medicoForm.value)
          .subscribe((resp: any) => {
            Swal.fire('Creado', `${nombre} correctamente`, 'success');
            this.router.navigateByUrl(`/medico/${resp.medico._id}`);
          });
    }
  }
}
