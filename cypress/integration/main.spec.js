/* eslint-env mocha, eslint-global cy */

context('Album Search', () => {
  beforeEach(() => {
    cy.visit('http://localhost:8000')
  })

  it('can toggle filters on and off', () => {
    cy.get('.filters__form-group').first()
      .find('input').first()
      .as('explicitCheck')

    cy.get('@explicitCheck')
      .uncheck()
      .should('not.be.checked')

    cy.get('.filters__form-group')
      .contains('Single')
      .parent().find('input')
      .check()
      .should('be.checked')

    cy.get('.filters__form-group')
      .contains('EP')
      .click()
      .siblings('input')
      .should('be.checked')
  })

  it('accepts text input', () => {
    cy.get('.search')
      .find('.search__form')
      .find('input')
      .type('Daft Punk', { delay: 100 })
      .should('have.value', 'Daft Punk')

    cy.get('article.album')
      .should('have.length', 13)
  })

  it('loads results from itunes', () => {
    cy.server()

    cy.fixture('itunes.json').as('itunesResponse')
    cy.route({
      method: 'GET',
      url: 'search*',
      delay: 500,
      response: '@itunesResponse'
    }).as('getSearch')

    cy.get('.search__form')
      .find('input:first')
      .type('Daft Punk')
      .should('have.value', 'Daft Punk')
      .get('.spinner').as('spinner')
      .should('be.visible')

    cy.wait('@getSearch')
      .get('main')
      .contains('Homework')
      .should('be.visible')

    cy.get('@spinner')
      .should('not.be.visible')

    cy.contains('Explicit')
      .click()

    cy.get('article.album').should('not.contain', 'Daft Club')
  })
})
