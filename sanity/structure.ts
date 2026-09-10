import type {StructureResolver} from 'sanity/structure'
import {orderableDocumentListDeskItem} from '@sanity/orderable-document-list'

export const structure: StructureResolver = (S, context) =>
  S.list()
    .title('Contenu')
    .items([
      S.listItem()
        .title('Project')
        .child(S.documentTypeList('project').title('Project')),
      S.divider(),
      S.listItem()
        .title('Home Page')
        .id('homePage')
        .child(S.document().schemaType('homePage').documentId('homePage')),
      orderableDocumentListDeskItem({
        type: 'project',
        title: 'Work',
        S,
        context,
      }),
      S.divider(),
      S.listItem()
        .title('Site Settings')
        .id('siteSettings')
        .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
    ])
