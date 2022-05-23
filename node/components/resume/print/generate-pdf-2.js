import PdfPrinter from 'pdfmake';
import { decode } from 'html-entities';

var INCH = 72;

var PATH_SAIRA_EXTRA_CONDENSED_EXTRABOLD = __dirname+'/google-fonts/sairaextracondensed/SairaExtraCondensed-ExtraBold.ttf';
var PATH_SAIRA_EXTRA_CONDENSED_BOLD = __dirname+'/google-fonts/sairaextracondensed/SairaExtraCondensed-Bold.ttf';
var PATH_SAIRA_EXTRA_CONDENSED = __dirname+'/google-fonts/sairaextracondensed/SairaExtraCondensed-Regular.ttf';
var PATH_MERRIWEATHER = __dirname+'/google-fonts/merriweather/Merriweather-Regular.ttf';

var SAIRA_EXTRA_CONDENSED = 'Saira Extra Condensed';
var SAIRA_EXTRA_CONDENSED_EXTRABOLD = 'Saira Extra Condensed ExtraBold';
var MERRIWEATHER = 'Merriweather';

function fonts() {
	var f = {};
	f[SAIRA_EXTRA_CONDENSED] = {
		normal: PATH_SAIRA_EXTRA_CONDENSED,
		bold: PATH_SAIRA_EXTRA_CONDENSED_BOLD,
		extrabold: PATH_SAIRA_EXTRA_CONDENSED_EXTRABOLD
	};
	f[SAIRA_EXTRA_CONDENSED_EXTRABOLD] = {
		normal: PATH_SAIRA_EXTRA_CONDENSED_BOLD,
		bold: PATH_SAIRA_EXTRA_CONDENSED_EXTRABOLD
	};
	f[MERRIWEATHER] = {
	  normal: PATH_MERRIWEATHER,
	};
	return f;
}
var FONTS = fonts();

var NAME = 'name';
var ADDRESS = 'address';
var BODY = 'body';
var H1 = 'h1';
var H2 = 'h2';
var H3 = 'h3';
var H4 = 'h4';
function style(font, fontSize, bold) {
  return {
    font: font,
    fontSize: fontSize,
    bold: bold
  };
}
function styles() {
	var s = {};
	s[NAME] = style(SAIRA_EXTRA_CONDENSED_EXTRABOLD, 26, true);
	s[ADDRESS] = style(SAIRA_EXTRA_CONDENSED_EXTRABOLD, 13.6, true);
	s[BODY] = style(MERRIWEATHER, 12, false);
	s[H1] = style(SAIRA_EXTRA_CONDENSED_EXTRABOLD, 12, true);
	s[H1].decoration = 'underline';
	//decorationStyle: 'double'
	s[H2] = style(SAIRA_EXTRA_CONDENSED, 12, true);
	s[H3] = style(SAIRA_EXTRA_CONDENSED, 12, false);
	s[H4] = style(SAIRA_EXTRA_CONDENSED, 12, false);
  return s;
}

function p(text, style) {
  return {
    text: text,
    style: style||BODY
  };
}
//convert args to array
function atoa() {
  var o = [];
  for (var a = 0; a < arguments.length; a++) {
    o.push(arguments[a]);
  }
  return o;
}
function cols() {
  var columns = [];
  // var alignment = arguments.length>=1?arguments[0];
  for (var a = 0; a < arguments.length; a++) {
    columns.push(arguments[a]);
  }
  return {
    columns: columns
  };
}
function rows() {
  var rows = [];
  for (var a = 0; a < arguments.length; a++) {
    rows.push(arguments[a]);
  }
  return rows;
}

function name(my) { return p(decode(my.displayName).toUpperCase(), NAME); }
function address(my) {
	var parts = [];
	if (my.addressLines && my.addressLines.length)
		my.addressLines.map((addressLine) => parts.push(addressLine));
	if (my.phoneNumber)
		parts.push(my.phoneNumber);
	if (my.emailAddress)
		parts.push(my.emailAddress);
	if (my.url)
		parts.push(my.url);
	if (parts.length > 0)
		return p(decode(parts.join(' · ')).toUpperCase(), ADDRESS);
	else
		return p('');
}

function objective(my) {
	return p(decode(my.objective), H4);
}

function generatePdf(stream, resume) {
	var all_styles = styles();
	var my = resume.sections.about.me;
	var my_name = { text: name(my), width: 1.6 * INCH };
	var my_address = { text: address(my), margin: [ 0, 0.235 * INCH, 0, 0 ], alignment: 'justify' };
	var my_about = cols(my_name, my_address);
	var content = rows(
		my_about
	);
	if (my.objective) {
		var my_objective_h1 = { text: p(decode('Objective').toUpperCase(), H1), width: 0.65 * INCH };
		var my_objective_p = { text: objective(my) };
		var my_objective = cols(my_objective_h1, my_objective_p);
		content.push(my_objective);
	}
	var experience = resume.sections.experience;
	var history = experience.history;
	if (history.length > 0) {
		var experience_h1 = { text: p(decode(experience.title).toUpperCase(), H1), width: 1 * INCH };
		content.push(experience_h1);
		for (var j = 0; j < history.length && j < 5; j++) {
			var job = history[j];
			if (job.featured) {
				var job_title = p(decode(job.title).toUpperCase(), H2);
				var dates = { text: p(decode(job.dates).toUpperCase(), H4), width: 1.75 * INCH, alignment: 'right' };
				var row = cols(job_title, dates);
				content.push(row);
				var parts = [];
				if (job.project)
					parts.push(job.project);
				if (job.company)
					parts.push(job.company);
				if (job.location)
					parts.push(job.location);
				if (parts.length > 0)
					content.push(p(decode(parts.join(' · ')).toUpperCase(), H3));
			}
		};
	}
	var education = resume.sections.education;
	var qualifications = education.qualifications;
	if (qualifications.length > 0) {
		var education_h1 = p(decode(education.title).toUpperCase(), H1);
		content.push(education_h1);
		for (var q = 0; q < qualifications.length; q++) {
			var qualification = qualifications[q];
			// if (qualification.featured) {
			var degree = p(decode(qualification.degree).toUpperCase(), H2);
			var dates = { text: p(decode(qualification.dates).toUpperCase(), H4), width: 1.75 * INCH, alignment: 'right' };
			var row = cols(degree, dates);
			content.push(row);
			var parts = [];
			if (qualification.majors) {
				var majors = qualification.majors.slice();
				if (majors.length > 2) {
					majors.splice(majors.length-1, 0, '&amp;');
					var major = majors.join(', ').replace('&amp;,', '&amp;');
					parts.push(major);
				}
				else if (majors.length == 2) {
					var major = majors.join(' &amp; ');
					parts.push(major);
				}
				else if (majors.length == 1)
					parts.push(majors[0]);
			}
			else if (qualification.major)
				parts.push(qualification.major);
			if (qualification.school)
				parts.push(qualification.school);
			if (qualification.location)
				parts.push(qualification.location);
			if (qualification.gpa)
				parts.push(qualification.gpa + ' GPA');
			if (parts.length > 0)
				content.push(p(decode(parts.join(' · ')).toUpperCase(), H3));
			// }
		}
	}
	var affiliations = resume.sections.affiliations;
	var memberships = affiliations.memberships;
	if (memberships.length > 0) {
		var affiliations_h1 = p(decode(affiliations.title).toUpperCase(), H1);
		content.push(affiliations_h1);
		for (var m = 0; m < memberships.length; m++) {
			var membership = memberships[m];
			// if (membership.featured) {
				var parts = [];
				if (membership.membership)
					parts.push(membership.membership);
				if (membership.organization)
					parts.push(membership.organization);
				if (membership.location)
					parts.push(membership.location);
				var affiliation = p(decode(parts.join(' · ')).toUpperCase(), H3);
				var dates = { text: p(decode(membership.dates).toUpperCase(), H4), width: 1.5 * INCH, alignment: 'right' };
				var row = cols(affiliation, dates);
				content.push(row);
			// }
		}
	}
	var awards = resume.sections.awards;
	var awarded = awards.awards;
	if (awarded.length > 0) {
		var awards_h1 = p(decode(awards.title).toUpperCase(), H1);
		content.push(awards_h1);
		for (var a = 0; a < awarded.length; a++) {
			var award = awarded[a];
			// if (award.featured) {
				var award_h2 = { text: p(decode(award.award).toUpperCase(), H2) };
				var dates = { text: p(decode(award.dates).toUpperCase(), H4), width: 1.5 * INCH, alignment: 'right' };
				var row = cols(award_h2, dates);
				content.push(row);
				var parts = [];
				if (award.issuer)
					parts.push(award.issuer);
				if (award.location)
					parts.push(award.location);
				if (parts.length > 0)
					content.push(p(decode(parts.join(' · ')).toUpperCase(), H3));
			// }
		}
	}
  var docDefinition = {
    content: content,
    styles: all_styles,
		pageSize: 'LETTER',
		pageOrientation: 'portrait',
		pageMargins: [0.5*INCH, 0.1*INCH, 0.5*INCH, 0]
  };
	var printer = new PdfPrinter(FONTS);
  var doc = printer.createPdfKitDocument(docDefinition);
  doc.pipe(stream);
  doc.end();
  // stream.end();
}

module.exports = generatePdf;
