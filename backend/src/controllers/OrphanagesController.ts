import { Request, Response } from 'express'
import { getRepository } from 'typeorm';
import orphanageView from '../views/orphanages_view'
import * as Yup from 'yup';

import Orphanage from '../models/Orphanage'

export default {
  async index(request: Request, response: Response){
    const orphanagesRepository = getRepository(Orphanage);

    const orphanages = await orphanagesRepository.find({
      relations: ['images']
    }) //Procurar todos os orfanatos
    
    response.json(orphanageView.renderMany(orphanages))
  },

  async show(request: Request, response: Response){
    const { id } = request.params;

    const orphanagesRepository = getRepository(Orphanage);

    const orphanage = await orphanagesRepository.findOneOrFail(id, {
      relations: ['images']
    }) //Procurar orfanato com um ID
    
    return response.json(orphanageView.render(orphanage))
  },

  async create(request: Request, response: Response){
    const {
      name,
      latitude,
      longitude,
      about,
      instructions,
      opening_hours,
      open_on_weekends,
    } = request.body
  
    const orphanagesRepository = getRepository(Orphanage);

    const requestImages = request.files as Express.Multer.File[];
    const images = requestImages.map(image =>{
      return {path: image.filename}
    })
  
    const data = { //Orfanato pré-criado
      name,
      latitude,
      longitude,
      about,
      instructions,
      opening_hours,
      open_on_weekends,
      images
    }

    const schema = Yup.object().shape({
      name: Yup.string().required('Nome obrigatório'),
      latitude: Yup.number().required('Latitude obrigatório'),
      longitude: Yup.number().required('Longitude obrigatório'),
      about: Yup.string().required('Sobre obrigatório').max(300),
      instructions: Yup.string().required('Instruções obrigatório'),
      opening_hours: Yup.string().required('Horário de funcionamento obrigatório'),
      open_on_weekends: Yup.boolean().required('Aberto durante o fim de semana obrigatório'),
      images: Yup.array(
        Yup.object().shape({
          path: Yup.string().required('Imagens obrigatórias')
        })
      )
    });

    await schema.validate(data, {
      abortEarly: false,
    })

    const orphanage = orphanagesRepository.create(data)
  
    await orphanagesRepository.save(orphanage) //Salvar no BD
  
    return response.status(201).json(orphanage)
  }
};